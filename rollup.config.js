import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-node-polyfills";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import scss from "rollup-plugin-scss";
import typescript from "rollup-plugin-typescript2";

const commonJsRequireReturnsDefault = function(id)
{
	if(String(id).includes("toolkit"))
		console.log(id);

	return "auto";
}

const config =
{
	input: "src/app.tsx",
	output:
	{
		file: "public/out.js",
		format: "iife",
		sourcemap: true,
		globals:
		{
		}
	},
	plugins:
	[
		replace({"process.env.NODE_ENV": JSON.stringify("development"), preventAssignment: true}),
		nodePolyfills(),
		resolve(),
		commonjs(),
		typescript(),
		json(),
		scss(),
	],
	external:
	[
	]
};

export default config;
