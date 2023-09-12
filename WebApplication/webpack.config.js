var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSass = new ExtractTextPlugin("[name].css");

module.exports = [
    {
        context: path.join(__dirname, './Scripts/containers/'),
        entry: {
            //画面のコンポーネントを指定
            sample: './Sample/Index.jsx',
            login: './Login/Index.jsx',
            logout: './Logout/Index.jsx',
            top: './Top/Index.jsx',
            realTimeMonitor: './RealTimeMonitor/Index.jsx',
            floorMap: './FloorMap/Index.jsx',
            capacity: './RackCapacity/Index.jsx',
            trendGraph: './TrendGraph/Index.jsx',
            rack: './Rack/Index.jsx',
            incidentLog: './IncidentLog/Index.jsx',
            powerSystem: './PowerSystem/Index.jsx',
            powerConnection: './PowerConnection/Index.jsx',
            dataReport: './DataReport/Index.jsx',
            rackMaintenance: 'RackMaintenance/Index.jsx',
            unitMaintenance: 'UnitMaintenance/Index.jsx',
            operationLog: './OperationLog/Index.jsx',
            point: './Point/Index.jsx',
            enterprise: './Enterprise/Index.jsx',
            locationMaintenance: './LocationMaintenance/Index.jsx',
            user: './User/Index.jsx',
            unit: './Unit/Index.jsx',
            template: './Template/Index.jsx',
            unitMove: './UnitMove/Index.jsx',
            networkConnection: './NetworkConnection/Index.jsx',
            locationView:'./LocationView/Index.jsx',
            alarmSidebar: './AlarmSidebar/Index.jsx',
            mainHeaderAlarm: './MainHeaderAlarm/Index.jsx',
            mainSidebar: './MainSidebar/Index.jsx',
            tag: './Tag/Index.jsx',
            device: './Device/Index.jsx',
            image: './Image/Index.jsx',
            import: './Import/Index.jsx',
            mailSetting: './MailSetting/Index.jsx',
            mailTemplate: './MailTemplate/Index.jsx',
            defaultSetting: './DefaultSetting/Index.jsx',
            soundSetting: './SoundSetting/Index.jsx',
            assetReport: './AssetReport/Index.jsx',
            workSchedule: './WorkSchedule/Index.jsx',
            graphic: './Graphic/Index.jsx',
            battery: './Battery/Index.jsx',
            reportSchedule: './ReportSchedule/Index.jsx',
            consumer: './Consumer/Index.jsx',
            consumerMaintenance: './ConsumerMaintenance/Index.jsx',
            controlSetting: './ControlSetting/Index.jsx',
            demandGraph: './DemandGraph/Index.jsx',
            demandSetting: './DemandSetting/Index.jsx',
            demandSummary: './DemandSummary/Index.jsx',
            controlSchedule: './ControlSchedule/Index.jsx',
            controlLog: './ControlLog/Index.jsx',
            electricLockSetting: './ElectricLockSetting/Index.jsx',
            electricLockMap: './ElectricLockMap/Index.jsx',
			electricLockOperation: './ElectricLockOperation/Index.jsx',
            eLockOpLog: './ELockOpLog/Index.jsx',
            patchboard: './Patchboard/Index.jsx',
            project: './Project/Index.jsx',
            lineConnectionLog: './LineConnectionLog/Index.jsx',
            line: './Line/Index.jsx',
            projectMaintenance: './ProjectMaintenance/Index.jsx',
            lineMaintenance: './LineMaintenance/Index.jsx',
            patchboardMaintenance: './PatchboardMaintenance/Index.jsx',
            projectSchedule: './ProjectSchedule/Index.jsx',
            dashboardSetting: './DashboardSetting/Index.jsx',
            icCard: './ICCard/Index.jsx',
            cardReadLog: './CardReadLog/Index.jsx',
            rackOperationDevice: './RackOperationDevice/Index.jsx'
        },
        output: {
            //ファイルの出力先の設定
            path: path.join(__dirname, 'build'),
            filename: '[name].bundle.js'
        },
        cache: true,
        watch: true,
        keepalive: true,
        failOnError: false,
        module: {
            rules: [
                // Transform JSX in .jsx files
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                }
                // ESLintを使用する場合は、下記のコメントアウトを解除する
                // 現状「missing in props validation  」が出るため、使用していない。それぞれにpropsTypeをつける必要がある。
                //},
                //{
                //    test: /\.jsx?$/,
                //    exclude: /node_modules/,
                //    loader: 'eslint-loader'
                //}
            ]
        },
        resolve: {
            modules: [__dirname + '/Scripts/components/', __dirname + '/Scripts/actions/', __dirname + '/Scripts/containers/', __dirname + '/Scripts/javascripts/'],
            // Allow require('./blah') to require blah.jsx
            extensions: ['.js', '.jsx']
        },
        resolveLoader: {
            modules: [path.join(__dirname, '/node_modules/')]
        },
        externals: {
            // Use external version of React (from CDN for client-side, or
            // bundled with ReactJS.NET for server-side)
            "react": 'React',
            "react-dom": "ReactDOM",
            "redux": "Redux",
            "react-redux": "ReactRedux",
            "react-router": "ReactRouter",
            "react-router-redux": "ReactRouterRedux",
            "redux-saga": "ReduxSaga",
            "redux-form": "ReduxForm",
            "react-bootstrap": "ReactBootstrap",
            "prop-types": "PropTypes",
            "classnames": "classNames",
            "react-svg-pan-zoom": "ReactSVGPanZoom",
            "react-datetime": "Datetime",
            "moment": "moment",
            "react-dnd": "ReactDnD",
            "react-dnd-html5-backend": "ReactDnDHTML5Backend",
            "react-slick": "Slider",
            "react-hot-keys": "ReactHotkeys"
        }
    },
    {
        context: path.join(__dirname, './Sass'),
        entry: {
            //SCSSファイルを指定
            rackViewStyle: './RackViewStyle.scss'
        },
        output: {
            path: path.join(__dirname, 'build/css'),
            filename: '[name].css'
        },
        cache: true,
        watch: true,
        keepalive: true,
        failOnError: false,
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: extractSass.extract(
                        {
                            fallback: "style-loader",
                            use: ["css-loader", "sass-loader"]
                        }
                    )
                }
            ]
        },
        plugins: [
            extractSass
        ]
    }
];