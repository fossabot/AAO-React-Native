/* global danger: 0, warn: 0, message: 0 */
import {readFileSync} from 'fs'
const readFile = filename => {
	try {
		return readFileSync(filename, 'utf-8')
	} catch (err) {
		if (err.code === 'ENOENT') {
			return ''
		}
		return err.message
	}
}
const readLogFile = filename => readFile(filename).trim()

const jsFiles = danger.git.created_files.filter(path => path.endsWith('.js'))

// new js files should have `@flow` at the top
jsFiles
	// except for those in /flow-typed
	.filter(filepath => !filepath.includes('flow-typed'))
	.filter(filepath => {
		const content = readFile(filepath)
		return !content.includes('@flow')
	})
	.forEach(file =>
		warn(`<code>${file}</code> has no <code>@flow</code> annotation!`),
	)

// revisit this when we move to yarn
// const packageChanged = danger.git.modified_files.includes('package.json')
// const lockfileChanged = danger.git.modified_files.includes('yarn.lock')
// if (packageChanged && !lockfileChanged) {
//   const message = 'Changes were made to package.json, but not to yarn.lock'
//   const idea = 'Perhaps you need to run <code>yarn install</code>?'
//   warn(`${message} - <i>${idea}</i>`)
// }

// Be careful of leaving testing shortcuts in the codebase
jsFiles
	.filter(filepath => filepath.endsWith('test.js'))
	.filter(filepath => {
		const content = readFile(filepath)
		return content.includes('it.only') || content.includes('describe.only')
	})
	.forEach(file =>
		warn(`An <code>only</code> was left in ${file} – no other tests can run.`),
	)

// Warn when PR size is large (mainly for hawken)
const bigPRThreshold = 400 // lines
const thisPRSize = danger.github.pr.additions + danger.github.pr.deletions
if (thisPRSize > bigPRThreshold) {
	warn(
		`
<details>
  <summary>:exclamation: Big PR!</summary>
  <blockquote>
    <p>We like to try and keep PRs under ${bigPRThreshold} lines, and this one was ${thisPRSize} lines.</p>
    <p>If the PR contains multiple logical changes, splitting each change into a separate PR will allow a faster, easier, and more thorough review.</p>
  </blockquote>
</details>`,
	)
}

//
// task=JS-flow
//
const isBadBundleLog = log => {
	const allLines = log.split('\n')
	const requiredLines = [
		'bundle: start',
		'bundle: finish',
		'bundle: Done writing bundle output',
		'bundle: Done copying assets',
	]
	return requiredLines.some(line => !allLines.includes(line))
}
const isBadDataValidationLog = log => {
	return log.split('\n').some(l => !l.endsWith('is valid'))
}

const fileLog = (name, log, {lang = null} = {}) => {
	message(
		`
<details>
  <summary>${name}</summary>

	const startIndex = findIndex(
		file,
		l => l.trim() === 'Summary of all failing tests',
	)
	const endIndex = findIndex(
		file,
		l => l.trim() === 'Ran all test suites.',
		startIndex,
	)

</details>`,
	)
}

//
// JS-lint
//

function runJSのLint() {
	const eslintLog = readLogFile('./logs/eslint')

if (prettierLog) {
	fileLog('Prettier made some changes', prettierLog, {lang: 'diff'})
}

if (eslintLog) {
	fileLog('Eslint had a thing to say!', eslintLog)
}

if (dataValidationLog && isBadDataValidationLog(dataValidationLog)) {
	fileLog("Something's up with the data.", dataValidationLog)
}

if (busDataValidationLog && isBadDataValidationLog(busDataValidationLog)) {
	fileLog("🚌 Something's up with the bus routes.", busDataValidationLog)
}

if (flowLog && flowLog !== 'Found 0 errors') {
	fileLog('Flow would like to interject about types…', flowLog)
}

if (iosJsBundleLog && isBadBundleLog(iosJsBundleLog)) {
	fileLog('The iOS bundle ran into an issue.', iosJsBundleLog)
}

if (androidJsBundleLog && isBadBundleLog(androidJsBundleLog)) {
	fileLog('The Android bundle ran into an issue.', androidJsBundleLog)
}

if (jestLog && jestLog.includes('FAIL')) {
	const lines = jestLog.split('\n')
	const startIndex = lines.findIndex(l =>
		l.includes('Summary of all failing tests'),
	)

	fileLog(
		'Some Jest tests failed. Take a peek?',
		lines.slice(startIndex).join('\n'),
	)
}

function parseXcodeProject(pbxprojPath /*: string*/) /*: Promise<Object>*/ {
	return new Promise((resolve, reject) => {
		const project = xcode.project(pbxprojPath)
		// I think this can be called twice from .parse, which is an error for a Promise
		let resolved = false
		project.parse((error, data) => {
			if (resolved) {
				return
			}
			resolved = true

			if (error) {
				reject(error)
			}
			resolve(data)
		})
	})
}

// eslint-disable-next-line no-unused-vars
async function listZip(filepath /*: string*/) {
	try {
		const {stdout} = await execFile('unzip', ['-l', filepath])
		const lines = stdout.split('\n')

		const parsed = lines.slice(3, -3).map(line => {
			const length = parseInt(line.slice(0, 9).trim(), 10)
			// const datetime = line.slice(12, 28)
			const filepath = line.slice(30).trim()
			const type = filepath.endsWith('/') ? 'folder' : 'file'
			return {size: length, filepath, type}
		})
		const zipSize = parsed.reduce((sum, current) => current.size + sum, 0)

		return {files: parsed, size: zipSize}
	} catch (err) {
		fail(
			h.details(
				h.summary(`Could not examine the ZIP file at <code>${filepath}</code>`),
				m.json(err),
			),
		)
	}
}

function listDirectory(dirpath /*: string*/) {
	try {
		return fs.readdirSync(dirpath)
	} catch (err) {
		fail(h.details(h.summary(`${h.code(dirpath)} does not exist`), m.json(err)))
		return []
	}
}

// eslint-disable-next-line no-unused-vars
function listDirectoryTree(dirpath /*: string*/) /*: any*/ {
	try {
		const exists = fs.accessSync(dirpath, fs.F_OK)

		if (!exists) {
			fail(
				h.details(
					h.summary(`Could not access <code>${dirpath}</code>`),
					m.code({}, listDirectory(dirpath).join('\n')),
				),
			)
		}

		return directoryTree(dirpath)
	} catch (err) {
		fail(
			h.details(
				h.summary('<code>listDirectoryTree</code> threw an error'),
				m.json(err),
			),
		)
		return {}
	}
}

async function didNativeDependencyChange() /*: Promise<boolean>*/ {
	const diff = await danger.git.JSONDiffForFile('package.json')

	if (!diff.dependencies && !diff.devDependencies) {
		return false
	}

	// If we need to, we can add more heuristics here in the future
	return true
}

//
// Run the file
//
schedule(main)
