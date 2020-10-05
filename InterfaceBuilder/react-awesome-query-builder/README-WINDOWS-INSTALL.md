### react-awesome-query-builder
## Installing on Windows

NOTE: Running `yarn` or `yarn install` will result in an error after it tries to run the command `npm run build-npm`. Below is the solution.

1. Install the latest git for Windows
    - https://git-scm.com/download/win
    - Git for Windows will also install a Bash terminal which is necessary to build this project.

1. Run
    - `yarn`
    - Ignore the `npm run build-npm` error at the end. The package installation step was successful.

2. Then run
    - `yarn build-npm`
    - You should see a Bash terminal popup which handles the build script. The process should end with a success statement.

### Explanation

When you ran `yarn install`, it installed all the packages and then tried to run `npm run build-npm` . But npm doesn’t trigger the git for windows bash popup.
