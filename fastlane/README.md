fastlane documentation
================
# Installation
```
sudo gem install fastlane
```
# Available Actions
### register
```
fastlane register
```
Adds any unregistered devices to the provisioning profile

----

## iOS
### ios test
```
fastlane ios test
```
Runs all the tests
### ios screenshot
```
fastlane ios screenshot
```
Take screenshots
### ios update_match
```
fastlane ios update_match
```
In case match needs to be updated - probably never needs to be run
### ios ci_keychains
```
fastlane ios ci_keychains
```
Do CI-system keychain setup
### ios build
```
fastlane ios build
```
Provisions the profiles; bumps the build number; builds the app
### ios beta
```
fastlane ios beta
```
Submit a new Beta Build to HockeyApp

----

## Android
### android build
```
fastlane android build
```
Makes a build
### android beta
```
fastlane android beta
```
Submit a new Beta Build to HockeyApp

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [https://fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [GitHub](https://github.com/fastlane/fastlane/tree/master/fastlane).