var gulp = require('gulp'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	uglify = require('gulp-uglify'),
	header = require('gulp-header'),
	concat = require('gulp-concat'),
	spriter = require('gulp-css-spriter'),
	tap = require('gulp-tap'),
	path = require('path'),
	fs = require('fs'),
	pkg = require('./package.json');

var banner = ['/*',
	' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)',
	' * Designed and developed by <%= pkg.author %>',
	' */',
	''].join('\n');

gulp.task('assets',function (){
	return gulp.src([
			'src/**/*.?(png|jpg|gif|json)',
			'src/**/zepto.min.js'
		])
		.pipe(gulp.dest('./dist'))
})

gulp.task('html', function() {
	gulp.src('./src/index.html')
		.pipe(tap(function (file){
			var dir = path.dirname(file.path)
			var con = file.contents.toString()
			con = con.replace(/<link\s+rel="import"\s+href="(.*)">/gi,function (match,$1){
				var filename = path.join(dir, $1);
				var id = path.basename(filename, '.html');
				var content = fs.readFileSync(filename, 'utf-8');
				return '<script type="text/html" id="tpl_'+ id +'">\n'+ content +'\n</script>';
			})
			
			file.contents = new Buffer(con);
		}))
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.reload({stream:true}))
});

gulp.task('style',function (){
	gulp.src('node_modules/weui/dist/style/weui.min.css')
		.pipe(gulp.dest('./dist/style'))

	setTimeout(function(){
		gulp.src('./src/style/index.scss')
			.pipe(sourcemaps.init())
			.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
			.pipe(autoprefixer(['iOS >= 7', 'Android >= 4.1']))
			.pipe(header(banner,{pkg:pkg}))
			.pipe(rename(function (path){
				path.basename = 'wm.min';
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./dist/style'))
			.pipe(browserSync.reload({stream:true}))
	},500);
})

gulp.task('js',function (){
	gulp.src([
			'./src/script/wm-common.js',
			'./src/script/wm-router.js'
			])
		.pipe(sourcemaps.init())
		.pipe(concat('wm.js'))
		.pipe(uglify().on('error',function (e){
			console.error(e);
			this.emit('end');
		}))
		.pipe(header(banner,{pkg:pkg}))
		.pipe(rename(function (path){
			path.basename += '.min';
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/script'))
		.pipe(browserSync.reload({stream:true}))
})

gulp.task('serve',function (){
	browserSync.init({
		server: {
		    baseDir: './dist'
		},
		port: 8080,
		ui: {
		    port: 8080,
		    weinre: {
		        port: 9090
		    }
		}
	})
})

gulp.task('reset',function (){
	gulp.src('./dist/*',{read: false})
		.pipe(clean());
})

gulp.task('release',function (){
	gulp.start('html','assets','js','style')
})

gulp.task('prod', ['release'])

gulp.task('dev',['serve','release'],function(){
	gulp.watch('src/style/**/*.scss',['style']);
	gulp.watch('src/script/wm-*.js',['js']);
	gulp.watch('src/**/*.?(png|jpg|gif|json)',['assets']);
	gulp.watch('src/**/*.html',['html']);
})

gulp.task('default', ['dev'])