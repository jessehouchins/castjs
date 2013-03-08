/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    qunit: {
      files: ['tests.html']
    }
    // jshint: {
    //   options: {
    //     curly: false,
    //     eqeqeq: false,
    //     immed: true,
    //     latedef: true,
    //     newcap: true,
    //     noarg: true,
    //     sub: true,
    //     undef: true,
    //     boss: true,
    //     eqnull: true,
    //     browser: true,
    //     asi: true,
    //     devel: true,
    //     globals: {
    //       requirejs: true,
    //       jQuery: true,
    //       require: true,
    //       define: true,
    //       _: true
    //     }
    //   },
    //   all: ['Gruntfile.js', 'app/assets/js/!(lib|plugins|templates|tmpl|ui)/**/*.js', 'app/assets/test/**/*.js']
    // },
  });

  // grunt.registerTask('test',    ['jshint', 'qunit'])
  grunt.registerTask('test',    ['qunit'])

  // load the grunt task plugins
  grunt.loadNpmTasks('grunt-contrib-qunit');
  // grunt.loadNpmTasks('grunt-contrib-compress')
  // grunt.loadNpmTasks('grunt-contrib-concat')
  // grunt.loadNpmTasks('grunt-contrib-copy')
  // grunt.loadNpmTasks('grunt-contrib-jshint')
  // grunt.loadNpmTasks('grunt-contrib-uglify')
};
