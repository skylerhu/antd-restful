module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "12"
        },
        modules: "auto",
        useBuiltIns: "usage",
        corejs: 3,
        include: [
          "es.string.replace-all"
        ],
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-nullish-coalescing-operator"
  ]
};
