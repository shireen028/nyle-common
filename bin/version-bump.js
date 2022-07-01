const fs = require('fs');
const { execSync } = require('child_process');
const semver = require('semver');

const gitStatus = execSync('git status -s');

if (gitStatus.length) {
    console.log("git status: ", gitStatus.toString('utf-8'));
    throw new Error('You have uncommited changes in your working directory. Commit or stash them before bumping the version.');
}

const packageJson = require('../package.json');

const oldVersion = packageJson.version;
const newVersion = semver.inc(oldVersion, 'patch');

packageJson.version = newVersion;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

execSync('git add package.json');

execSync(`git commit -m 'Version bump: ${newVersion}'`);
execSync(`git tag ${newVersion}`);

console.log(`
git push origin
git push origin --tags
`);