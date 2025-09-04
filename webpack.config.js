// deps

	// natives
	const { join } = require("path");

// consts

  const PUBLIC = join(__dirname, "public");

// module

module.exports = {

  "mode": "development",

  "entry": join(PUBLIC, "src", "index.tsx"),
  "output": {
    "filename": "bundle.js",
    "path": PUBLIC
  },

  "devtool": "source-map",

  "module": {
    "rules": [
      {
        "test": /\.tsx?$/,
        "exclude": [ /node_modules/ ],
        "use": [
            {
                "loader": "ts-loader",
                "options": {
                    "configFile": join(__dirname, "tsconfig-front.json")
                }
            }
        ]
      }
    ]
  },

  "resolve": {
    "extensions": [ ".tsx", ".ts", ".js" ],
  }

};
