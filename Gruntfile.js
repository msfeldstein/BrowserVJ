/**
 * Gruntfile.js
 *
 * Copyright (c) 2012 quickcue
 */


module.exports = function(grunt) {
    // Load dev dependencies
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Time how long tasks take for build time optimizations
    require('time-grunt')(grunt);

    // Configure the app path
    var base = 'app';
    var out = 'dist';

    grunt.initConfig({

        paths: {
            base: 'app',
            out: 'dist'
        },
        pkg: grunt.file.readJSON('package.json'),
        bowercopy: grunt.file.readJSON('bowercopy.json'),
        coffee: {
            compile: {
                options: {
                    join: true,
                    sourceMap: true
                },
                files: {
                    "dist/js/app.js": [base + "/js/effects/_shaderpass.coffee", base + '/js/**/*.coffee']
                }
            }
        },
        concat: {
            options: {
                separator: ';',
            },
            out: {
                src: ['app/js/lib/**/*.js'],
                dest: 'dist/js/libs.js'
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [ out ]
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [ base + '/js/*.js' ]
        },
        jsonlint: {
            pkg: [ 'package.json' ],
            bower: [ '{bower,bowercopy}.json' ]
        },
        watch: {
            coffee: {
                files: [
                    '**/*.coffee'
                ],
                tasks: ['coffee']
            },
            concat: {
                files: ['app/js/lib/**/*.js'],
                tasks: ['concat']
            },
            json: {
                files: [
                    '{package,bower}.json'
                ],
                tasks: ['jsonlint']
            },
            // Live reload
            reload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= watch.js.files %>',
                    '<%= watch.json.files %>',
                    '<%= watch.coffee.files %>',
                    base + '/css/**/*.css',
                    '**/*.html'
                ]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: base,
                    dest: out,
                    src: [
                        '*.{ico,png,txt}',
                        '{,*/}*.html',
                        'bower_components/' + (this.includeCompass ? 'sass-' : '') + 'bootstrap/' + (this.includeCompass ? 'fonts/' : 'dist/fonts/') +'*.*',
                        '**/*.js',
                        '**/*.css'
                    ]
                }]
            },
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= paths.out %>/*',
                        '!<%= paths.out %>/.git*'
                    ]
                }]
            }
        }
    });

    grunt.registerTask('serve', function () {
        grunt.task.run([
            'copy',
            'connect:livereload',
            'coffee',
            'concat',         
            'watch'
        ]);
    });

    grunt.registerTask('default', ['newer:jsonlint', 'newer:jshint', 'serve']);
};
