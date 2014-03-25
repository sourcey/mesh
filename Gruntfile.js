module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            css: {
                src: [
                    'src/*.css'
                ],
                dest: 'dist/mesh.css'
            },
            js: {
                src: [
                    'src/*.js'
                ],
                dest: 'dist/mesh.js'
            }
        },
        cssmin: {
            css: {
                src: 'dist/mesh.css',
                dest: 'dist/mesh.min.css'
            }
        },
        uglify: {
            js: {
                files: {
                    'dist/mesh.min.js': ['dist/mesh.js']
                }
            }
        },
        watch: {
          files: ['src/*'],
          tasks: ['concat', 'cssmin', 'uglify']
       }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['concat:css', 'cssmin:css', 'concat:js', 'uglify:js']);
};