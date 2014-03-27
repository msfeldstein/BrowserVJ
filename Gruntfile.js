module.exports = function(grunt) {
    // Load dev dependencies
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-concat');

    require('time-grunt')(grunt);

    // Configure the app path
    var base = 'app';
    var out = 'dist';

    grunt.initConfig({
        coffee: {
            compile: {
                options: {
                    join: true,
                    sourceMap: true
                },
                files: {
                    "dist/js/app.js": [base + "/js/_*.coffee", base + "/js/**/_*.coffee", base + '/js/**/*.coffee']
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
        watch: {
            coffee: {
                files: [
                    '**/*.coffee'
                ],
                tasks: ['coffee']
            },
            css: {
                files: [
                    base + '/**/*.css'
                ],
                tasks: ['copy:css']
            },
            concat: {
                files: ['app/js/lib/**/*.js'],
                tasks: ['concat']
            },
            js: {
                files: ['app/js/**/*.js'],
                tasks: ['copy:js']
            },
            html: {
                files: [base + '/**/*.html'],
                tasks: ['copy:html']
            },
            // Live reload
            reload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= watch.js.files %>',
                    '<%= watch.coffee.files %>',
                    base + '/css/**/*.css',
                    base + '/**/*.html'
                ]
            }
        },
        copy: {
            html: {
                files: [{
                    expand: true,
                    cwd: base,
                    dest: out,
                    src: [
                        '{,*/}*.html'
                    ]
                }]                
            },
            css: {
                files: [{
                    expand: true,
                    cwd: base,
                    dest: out,
                    src: [
                        '**/*.css',
                    ]
                }]                
            },
            js: {
                files: [{
                    expand: true,
                    cwd: base,
                    dest: out,
                    src: [
                        '**/*.js',
                    ]
                }]                
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: base,
                    dest: out,
                    src: [
                        '*.{ico,png,txt}',
                        '{,*/}*.html',
                        'bower_components/' + (this.includeCompass ? 'sass-' : '') + 'bootstrap/' + (this.includeCompass ? 'fonts/' : 'dist/fonts/') +'*.*',
                        '**/*.js',
                        '**/*.css',
                        'assets/*'
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
                        out + '/*',
                    ]
                }]
            }
        }
    });

    grunt.registerTask('serve', function () {
        grunt.task.run([
            'connect:livereload',
            'coffee',
            'concat',
            'copy:dist',      
            'watch'
        ]);
    });

    grunt.registerTask('default', ['serve']);
};
