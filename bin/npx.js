#! /usr/bin/env node
const
	fs = require('fs'),
	dir = './config',
	path = require('path'),
	mappings = require('../base-config')

!fs.existsSync(
	path.join(process.cwd(), 'config')
)
&& fs.mkdirSync(path.join(process.cwd(), 'config'))

mappings.forEach(mapping => {
	//TODO: this means that this
	!fs.existsSync(
		path.join(process.cwd(), 'config/' + mapping)
	)
	&& fs.copyFileSync(
		path.join(
			process.cwd(),
			'node_modules/jester/base-config/' + mapping + '.js'
		),
		path.join(process.cwd(), 'config/' + mapping + '.js')
	)
})

fs.existsSync(
	path.join(process.cwd(), 'jester')
)
&& fs.unlinkSync(
	path.join(process.cwd(), 'jester.js')
)

fs.copyFileSync(
	path.join(
		process.cwd(),
		'node_modules/jester/jester.js'
	),
	path.join(process.cwd(), 'jester.js')
)

