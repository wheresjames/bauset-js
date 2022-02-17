#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');
const path = require('path');
const __config__ = require('./config.js');
module.exports =
{
    __config__      : __config__,
    __info__        : __config__.__info__,
    fileCopy        : fileCopy,
    createDox       : createDox,
    createPackage   : createPackage
};


/** Copies files and or directories

    @param [in] src     - Source file or directory
    @param [in] dst     - Destination file or directory
    @param [in] opts    - Options
                            overwrite - If true existing directorys or files will be overwritten
                            recursive - If true, recurse into sub directories
                            Log       - Logging function or null to disable logging
*/
function fileCopy(src, dst, opts={overwrite:true, recursive:true, Log:null})
{
    // Ensure the source exists
    if (!fs.existsSync(src))
    {   if (opts.Log)
            opts.Log(`[ignore] Not found: ${src}`);
        return;
    }

    // If the source is a file just copy it
    if (!fs.lstatSync(src).isDirectory())
    {   fs.copyFileSync(src, dst);
        if (opts.Log)
            opts.Log(`[copied] ${src} -> ${dst}`);
        return;
    }

    // Delete the destination if it exists
    if (fs.existsSync(dst))
    {   if (fs.lstatSync(dst).isDirectory())
            fs.rmdirSync(dst, { recursive: true });
        else
            fs.unlinkSync(dst);
    }

    // Create the destination directory
    if (!fs.existsSync(dst))
        fs.mkdirSync(dst);

    // Copy each file / directory
    let dirlist = fs.readdirSync(src);
    for (let i = 0; i < dirlist.length; i++)
    {
        let name = dirlist[i];
        let fsrc = path.join(src, name);
        let fdst = path.join(dst, name);
        let status = '';
        if (!opts.overwrite && fs.existsSync(fdst))
            status = 'exists';
        else
        {
            let stat;
            try { stat = fs.lstatSync(fsrc); }
            catch(e) { if (opts.Log) opts.Log(e); continue; }
            status = 'copied';
            if (!stat.isDirectory())
                fs.copyFileSync(fsrc, fdst);
            else if (opts.recursive)
                fileCopy(fsrc, fdst, opts);
            else
                status = 'ignore';
        }
        if (status && opts.Log)
            opts.Log(`[${status}] ${fsrc} -> ${fdst}`);
    }
}

/** Create doxygen documentation

    @param [in] opts    - Options
                            Log       - Logging function or null to disable logging

*/
function createDox(cfg, src, dst, opts)
{
    return new Promise((resolve, reject)=>
    {
        let doxygen = null;
        try { doxygen = require('doxygen'); }
        catch(e){ return reject(e); }

        opts.Log("\Preparing doxygen...");

        let dcfg = path.join(dst, 'doxygen.cfg');
        return doxygen.downloadVersion()
            .then((data) =>
            {
                opts.Log("\nGenerating Documentation...");
                var doxopts = {
                    PROJECT_NAME        : cfg.name,
                    OUTPUT_DIRECTORY    : path.join(src, 'dox'),
                    INPUT               : dst,
                    RECURSIVE           : "YES",
                    FILE_PATTERNS       : ["*.js"],
                    EXTENSION_MAPPING   : "js=Javascript",
                    GENERATE_LATEX      : "NO",
                    EXCLUDE_PATTERNS    : ["*/node_modules/*"]
                };
                doxygen.createConfig(doxopts, dcfg);
                return resolve(doxygen.run(dcfg));
            });
    });
}

/** Stages npm module and creates package

    @param [in] src     - Source directory
    @param [in] dst     - Destination directory
    @param [in[ opts    - Options
                            install   - True if created package should be installed
                            global    - True if packages should be installed globally
                                            Only effective if opts.install is set
                            test      - True if package test script should be run
                                            ./test/test.js
                            Log       - Logging function or null to disable logging

*/
function createPackage(src, dst, opts)
{
    if (!opts.Log)
        opts.Log = ()=>{};

    // Delete output directory if it already exists
    if (fs.existsSync(dst))
        fs.rmdirSync(dst, { recursive: true });

    // Create new output directory
    fs.mkdirSync(dst);
    if (!fs.existsSync(dst))
        throw `Failed to create output directory : ${dst}`;

    // Set working directory
    process.chdir(dst);

    // Load the config file
    let cfg_in = path.join(src, 'PROJECT.txt');
    let cfg_out = path.join(dst, 'PROJECT.json');
    let cfg = __config__.loadConfig(cfg_in);
    if (0 >= Object.keys(cfg).length)
        throw `Failed to load config: ${cfg_in}`;
    let now = new Date();
    cfg['__created__'] = now.getTime() / 1000;
    cfg['__createdstr__'] = now.toISOString();
    fs.writeFileSync(cfg_out, JSON.stringify(cfg, null, 2));

    // Create package file
    let pck_in = path.join(src, 'var', 'in.package.json');
    let pck_out = path.join(dst, 'package.json');
    __config__.processFile(cfg, pck_in, pck_out);
    if (!fs.existsSync(pck_out))
        throw `Failed to create package file : ${pck_out}`;

    // Copy install files
    for (let v of ['PROJECT.txt', 'README.md', 'LICENSE', 'lib', 'bin', 'test', 'doc'])
        fileCopy(path.join(src, v), path.join(dst, v), opts);

    // Installing?
    opts.Log("\n=================================================\nPackaging...");

    const cp = require('child_process');

    let cmd = `npm pack`;
    cp.exec(cmd, { cwd: dst }, (error, stdout, stderr) =>
        {
            if (error)
                throw error;

            opts.Log(stdout);
            opts.Log(stderr);
            opts.Log('Done Packaging');

            // Did we get a package
            let npkg = `${cfg.name}-${cfg.version}.tgz`
            let spkg = path.join(dst, npkg);
            if (!fs.existsSync(spkg))
                throw `Failed to create package : ${spkg}`;

            // Copy package file
            let rpkg = path.join(src, 'pkg');
            if (!fs.existsSync(rpkg))
                fs.mkdirSync(rpkg);

            // Copy package file
            let dpkg = path.join(rpkg, npkg);
            fs.renameSync(spkg, dpkg);
            fs.copyFileSync(dpkg, path.join(rpkg, `${cfg.name}-latest.tgz`));

            opts.Log(`Created : ./pkg/${cfg.name}-latest.tgz -> ./pkg/${npkg}\n`);

            if (opts.install)
            {
                opts.Log("\n=================================================\nInstalling...");
                let sudo = fs.existsSync('/usr/bin/sudo') ? 'sudo ' : '';
                let cmd = opts.global ? (sudo+`npm install -g ${dpkg}`) : `npm install ${dpkg}`;
                cp.exec(cmd, { cwd: dst }, (error, stdout, stderr) =>
                    {   if (error)
                            throw error;
                        opts.Log(stdout);
                        opts.Log(stderr);
                        opts.Log('Done Installing');

                        if (opts.test)
                        {
                            opts.Log("\n=================================================\nTesting...");

                            let tf = path.join(src, "test/test.js");
                            if (!fs.existsSync(tf))
                                opts.Log(`Test file not found: ${tf}`);
                            else
                            {
                                opts.Log(`Running ${tf}`);
                                cp.exec(tf, { cwd: dst }, (error, stdout, stderr) =>
                                    {   if (error)
                                            throw error;
                                        opts.Log(stdout);
                                        opts.Log(stderr);
                                        opts.Log('Done Testing');
                                    });
                            }
                        }
                    });
            }
        });
}
