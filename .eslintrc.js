module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base", "prettier"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "plugins": [
        "@typescript-eslint",
        "prettier"
    ],
    "rules": {
      "prettier/prettier" : "error",
      "class-methods-use-this" : "off",  
      "no-param-reassign" : "off",
      "camelcase" : "off",
      "no-unused-vars" : ["error",  {"argsIgnorePattern" : "next"}]
    }
};