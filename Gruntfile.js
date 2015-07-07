'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      app: {
        src: ['app/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      app: {
        files: '<%= jshint.app.src %>',
        tasks: ['jshint:app']
      },
      appDeploy: {
        files: '<%= jshint.app.src %>',
        tasks: ['jshint:app','rsync:prod']
      },
    },
    rsync: {
        options: {
            args: ["--verbose"],
            exclude: [".git*","*.scss","node_modules"],
            recursive: true
        },
        prod: {
            options: {
                src: ".",
                dest: "/home/pi/pixframe-hardware",
                host: "pi@raspixframe.local",
                delete: true // Careful this option could cause data loss, read the docs!
            }
        }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-rsync");

  // Default task.
  grunt.registerTask('default', ['jshint', 'watch:app']);
  // rsync deploy over LAN
  grunt.registerTask('deploy', ['rsync:prod']);
  grunt.registerTask('cont-deploy', ['jshint', 'watch:appDeploy']);


};
