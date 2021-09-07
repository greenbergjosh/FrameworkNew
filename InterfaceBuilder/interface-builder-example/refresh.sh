cd ..
yarn build
cd example
rm -rf node_modules/@opg/interface-builder
md node_modules/@opg/interface-builder
cp -a ../lib/. node_modules/@opg/interface-builder/
yarn start
