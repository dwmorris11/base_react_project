import path from 'path';
import dotenv from 'dotenv';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import pkg from "webpack";
const { DefinePlugin } = pkg;
dotenv.config();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import FileManagerPlugin from 'filemanager-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let __SERVER__;
let __APP_AUTHORITY__;
let __APP_ID__;
let __REDIRECT_URI__;
let __PRODUCT_TITLE__;
let __CLIENT_SERVER_IP__;
let __CUSTOMER_LOGO__;
let __HOME_IMAGE_1__;
let __HOME_IMAGE_2__;
let __HOME_IMAGE_3__;
let __CUSTOMER_SETTINGS__;
let __MAX_LENGTH__;
let __EXPIRATION_TIME__;
let __USEAUTH__;

const loadCustomerSettings = function () {
    // Read customer settings from a json file
    const file = 'customerSettings.json';
    const path = `./${file}`;
    if (!fs.existsSync(path)) {
        throw new Error(`File ${file} does not exist`);
    }
    const data = fs.readFileSync(path);
    return JSON.parse(data);
};
const config = loadCustomerSettings();
const setupClientServer = function () {
    switch (process.env.NODE_ENV) {
        case 'development':
            __SERVER__ = "http://localhost:3000";
            __REDIRECT_URI__ = `${__SERVER__}/redirect.html`;
            process.env.__DEBUG__ = true;
            console.log("development", __SERVER__, __REDIRECT_URI__)
            break;
        case 'production':
            __SERVER__ = config.serverUri;
            __REDIRECT_URI__ = `${config.clientUri}/redirect.html`;
            process.env.__DEBUG__ = false;
            console.log("production", __SERVER__, __REDIRECT_URI__)
            break;
        default:
            __SERVER__ = config.serverUri;
            __REDIRECT_URI__ = `${config.clientUri}/redirect.html`;
            console.log("production", __SERVER__, __REDIRECT_URI__)
            break;
    }
    process.env.__SERVER__ = __SERVER__;
    process.env.__REDIRECT_URI__ = __REDIRECT_URI__;
    process.env.__APP_AUTHORITY__ = config.appAuthority;
    process.env.__APP_ID__ = config.appId;
    process.env.__PRODUCT_TITLE__ = config.productTitle;
    process.env.__CLIENT_SERVER_IP__ = config.clientServerIp;
    process.env.__CUSTOMER_LOGO__ = config.customerLogo;
    process.env.__HOME_IMAGE_1__ = config.homeImage1;
    process.env.__HOME_IMAGE_2__ = config.homeImage2;
    process.env.__HOME_IMAGE_3__ = config.homeImage3;
    process.env.__CUSTOMER_SETTINGS__ = config.customerSettings;
    process.env.__MAX_LENGTH__ = config.maxLength;
    process.env.__EXPIRATION_TIME__ = config.expirationTime;
    process.env.__USEAUTH__ = config.useAuth;
};

setupClientServer();

const common = function (env, argv) {
    const mode = argv.mode || 'production';
    const entry = {
        index: path.join(__dirname, 'src/index.tsx')
    };
    const output = {
        path: path.join(__dirname, "public"),
        filename: '[name].bundle.js',
        clean: true
    };
    const htmlpluginoptions = {
        template: path.join(__dirname, '/clientserver/static_files/index.html'),
        filename: 'index.html',
        inject: 'body',
        templateParameters: {
            title: __PRODUCT_TITLE__,
        },
        hash: true
    };
    return {
        output,
        mode,
        entry,
        target: 'web',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            alias: {
                src: path.join(__dirname, 'Client'),
            }
        },
        plugins: [new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin(htmlpluginoptions),
        new DefinePlugin({
            "__SERVER__": JSON.stringify(__SERVER__),
            "__APP_AUTHORITY__": JSON.stringify(__APP_AUTHORITY__),
            "__APP_ID__": JSON.stringify(__APP_ID__),
            "__REDIRECT_URI__": JSON.stringify(__REDIRECT_URI__),
            "__PRODUCT_TITLE__": JSON.stringify(__PRODUCT_TITLE__),
            "__CLIENT_SERVER_IP__": JSON.stringify(__CLIENT_SERVER_IP__),
            "__CUSTOMER_LOGO__": JSON.stringify(__CUSTOMER_LOGO__),
            "__HOME_IMAGE_1__": JSON.stringify(__HOME_IMAGE_1__),
            "__HOME_IMAGE_2__": JSON.stringify(__HOME_IMAGE_2__),
            "__HOME_IMAGE_3__": JSON.stringify(__HOME_IMAGE_3__),
            "__CUSTOMER_SETTINGS__": JSON.stringify(__CUSTOMER_SETTINGS__),
            "__MAX_LENGTH__":JSON.stringify(__MAX_LENGTH__),
            "__EXPIRATION_TIME__": JSON.stringify(__EXPIRATION_TIME__),
            "__USEAUTH__": JSON.stringify(__USEAUTH__),
            "__DEBUG__": JSON.stringify(process.env.__DEBUG__)
        }),
        new FileManagerPlugin(
            {
                events: {
                    onEnd: {
                        copy: [
                            {source: "clientserver/assets/*",
                             destination: "public/assets"
                            },
                            {
                             source: "clientserver/static_files/redirect.html",
                             destination: "public/redirect.html"
                            }
                        ]
                    }
                }
            }
        )],
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    loader: 'esbuild-loader',
                    options: {
                        target: 'esnext'
                    }
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
            ]
        }
    }
};

export default common;