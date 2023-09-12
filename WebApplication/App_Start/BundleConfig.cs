using System.Web;
using System.Web.Optimization;

namespace garmit.Web
{
    public class BundleConfig
    {
        /// <summary>
        /// 複数のJS/JSXファイルまたはCSSファイルをまとめて一つのバンドルファイルにまとめる。
        /// ファイルをバンドルにまとめることによって、サーバへのリクエスト数やファイルサイズの削減に効果がある。
        /// バンドルしたファイルは、cshtmlファイル内で、<pre>@Scripts.Render("~/bundles/react")</pre>というように記述して参照します。
        /// 
        /// For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        /// </summary>
        /// <param name="bundles"></param>
        public static void RegisterBundles(BundleCollection bundles)
        {
            //jQuery関連のJavaScriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/node_modules/jquery/dist/jquery.min.js",
                        "~/node_modules/jquery-toast-plugin/dist/jquery.toast.min.js",
                        "~/node_modules/moment/min/moment.min.js",
                        "~/node_modules/moment/locale/ja.js",
                        "~/node_modules/spectrum-colorpicker/spectrum.js",
                        "~/node_modules/svg-z-order/svg-z-order.js",
                        "~/node_modules/web-animations-js/web-animations.min.js",
                        "~/node_modules/muuri/muuri.min.js",
                        "~/node_modules/lodash/lodash.min.js",
                        "~/node_modules/fullcalendar/dist/fullcalendar.min.js"
                       ));

            //jQuery-UI関連のJavaScriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/jquery-ui").Include(
                        "~/node_modules/jquery-ui-dist/jquery-ui.min.js"
                       ));

            bundles.Add(new ScriptBundle("~/bundles/jqplot").Include(
                        //"~/node_modules/jqplot/src/jquery.jqplot.js",
                        "~/node_modules/jqplot/src/jqplot.core.js",
                        "~/node_modules/jqplot/src/jqplot.linearTickGenerator.js",
                        "~/node_modules/jqplot/src/jqplot.linearAxisRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.axisTickRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.axisLabelRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.tableLegendRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.lineRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.markerRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.divTitleRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.canvasGridRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.linePattern.js",
                        "~/node_modules/jqplot/src/jqplot.shadowRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.shapeRenderer.js",
                        "~/node_modules/jqplot/src/jqplot.sprintf.js",
                        "~/node_modules/jqplot/src/jsdate.js",
                        "~/node_modules/jqplot/src/jqplot.themeEngine.js",
                        "~/node_modules/jqplot/src/jqplot.effects.core.js",
                        "~/node_modules/jqplot/src/jqplot.effects.blind.js",
                        "~/node_modules/jqplot/src/plugins/jqplot.canvasAxisTickRenderer.js",
                        "~/node_modules/jqplot/src/plugins/jqplot.cursor.js",
                        "~/node_modules/jqplot/src/plugins/jqplot.dateAxisRenderer.js",
                        "~/node_modules/jqplot/src/plugins/jqplot.enhancedLegendRenderer.js"
                       ));

            //Bootstrap3関連のJavaScriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                        "~/node_modules/datatables.net/js/jquery.dataTables.js",
                        "~/node_modules/datatables.net-bs/js/dataTables.bootstrap.js",
                        "~/node_modules/bootstrap-treeview/src/js/bootstrap-treeview.js",
                        "~/node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect.js",
                        "~/node_modules/bootstrap-slider/dist/bootstrap-slider.min.js"
                       ));


            //React関連のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/react").Include(
                        "~/node_modules/react/umd/react.production.min.js",
                        "~/node_modules/react-dom/umd/react-dom.production.min.js",
                        "~/node_modules/react-router/umd/ReactRouter.js",
                        "~/node_modules/react-bootstrap/dist/react-bootstrap.js",
                        "~/node_modules/prop-types/prop-types.min.js",
                        "~/node_modules/classnames/index.js",
                        "~/node_modules/react-svg-pan-zoom/build-umd/react-svg-pan-zoom.min.js",
                        "~/node_modules/react-datetime/dist/react-datetime.js",
                        "~/node_modules/react-dnd/dist/ReactDnD.js",
                        "~/node_modules/react-dnd-html5-backend/dist/ReactDnDHTML5Backend.min.js",
                        "~/node_modules/react-slick/dist/react-slick.min.js",
                        "~/node_modules/react-hot-keys/dist/react-hotkeys.min.js"
                       ));

            //Redux関連のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/redux").Include(
                        "~/node_modules/redux/dist/redux.js",
                        "~/node_modules/react-redux/dist/react-redux.js",
                        "~/node_modules/react-router-redux/dist/ReactRouterRedux.js",
                        "~/node_modules/redux-saga/dist/redux-saga.js",
                        "~/node_modules/redux-form/dist/redux-form.js"
                       ));
            
            //Babel関連のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/babel").Include(
                        "~/node_modules/babel-polyfill/dist/polyfill.js"
                       ));

            //その他のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/other").Include(
                        "~/node_modules/number-format.js/lib/format.min.js",
                        "~/node_modules/svg.js/dist/svg.min.js",
                        "~/node_modules/svg.draggable.js/dist/svg.draggable.min.js",
                        "~/node_modules/svg.resize.js/dist/svg.resize.min.js",
                        "~/node_modules/svg-z-order/svg-z-order.js",
                        "~/node_modules/encoding-japanese/encoding.min.js",
                        "~/node_modules/echarts/dist/echarts.min.js",
                        "~/node_modules/chroma-js/chroma.min.js"
                       ));

            //Transformをクリアが必要なjavascriptをまとめる
            bundles.Add(GetTransformClearedScriptBundle("~/bundles/cleared",
                        "~/node_modules/svg.select.js/dist/svg.select.min.js"
                       ));

            //garmitDC用のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/garmit-dc").Include(
                        "~/garmit-frame/garmit-dc/js/bootstrap.min.js",
                        "~/garmit-frame/garmit-dc/js/sticky-state.min.js",
                        "~/garmit-frame/garmit-dc/js/jquery.mCustomScrollbar.concat.min.js",
                        "~/garmit-frame/garmit-dc/js/jquery.inview.min.js",
                        "~/garmit-frame/garmit-dc/js/garmit-dc-frame.min.js"
                       ));

            //garmitME用のjavascriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/garmit-me").Include(
                        "~/garmit-frame/garmit-me/js/bootstrap.min.js",
                        "~/garmit-frame/garmit-me/js/sticky-state.min.js",
                        "~/garmit-frame/garmit-me/js/jquery.mCustomScrollbar.concat.min.js",
                        "~/garmit-frame/garmit-me/js/jquery.inview.min.js",
                        "~/garmit-frame/garmit-me/js/garmit-me-frame.min.js"
                       ));

            //Webアプリケーション独自のJavaScriptをまとめる
            bundles.Add(new ScriptBundle("~/bundles/sitejs").Include(
                        "~/Content/js/react-utility.js"
                       ));

            //Webフォント(Defer)のJavaScriptをまとめる
            //bundles.Add(new ScriptBundle("~/bundles/fontsdefer").Include(
            //            "~/garmit-frame/js/fontawesome-all.js"
            //           ));

            //jQuery関連のCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/jquery").Include(
                        "~/node_modules/jquery-ui-dist/jquery-ui.min.css",
                        "~/node_modules/jquery-toast-plugin/dist/jquery.toast.min.css",
                        "~/node_modules/spectrum-colorpicker/spectrum.css",
                        "~/node_modules/jqplot/src/jquery.jqplot.css",
                        "~/node_modules/fullcalendar/dist/fullcalendar.min.css"
                       ));

            //Bootstrap3関連のCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/bootstrap").Include(
                        "~/node_modules/datatables.net-bs/css/dataTables.bootstrap.css",
                        "~/node_modules/bootstrap-multiselect/dist/css/bootstrap-multiselect.css",
                        "~/node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css"
                       ));
            
            //React関連のCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/react").Include(
                        "~/node_modules/react-datetime/css/react-datetime.css",
                        "~/node_modules/slick-carousel/slick/slick.css"
                       ));

            //WebフォントのCSSをまとめる        TODO 最終的に削除する必要がある（デザイン変更対応のため）
            bundles.Add(new StyleBundle("~/styles/fonts").Include(
                        "~/node_modules/font-awesome/css/font-awesome.min.css", new CssRewriteUrlTransform()
                       ));

            //garmitDCのCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/garmit-dc").Include(
                        "~/garmit-frame/garmit-dc/css/bootstrap-garmit-dc.min.css", new CssRewriteUrlTransform()
                       ));

            //garmitMEのCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/garmit-me").Include(
                        "~/garmit-frame/garmit-me/css/bootstrap-garmit-me.min.css", new CssRewriteUrlTransform()
                       ));

            //Webアプリケーション独自のCSSをまとめる
            bundles.Add(new StyleBundle("~/styles/sitecss").Include(
                        "~/Content/Site.css",
                        "~/Content/AssetStyle.css",
                        "~/Content/RackTableStyle.css",
                        "~/Content/NetworkViewStyle.css",
                        "~/Content/DashboardStyle.css"
                       ));

            //scssファイルをコンパイルしたcssをまとめる
            bundles.Add(new StyleBundle("~/styles/buildcss").Include(
                        "~/build/css/rackViewStyle.css"
                       ));
        }

        /// <summary>
        /// Transformをクリアしたバンドルを取得する
        /// </summary>
        /// <param name="virtualPath">仮想パス</param>
        /// <param name="scriptPath">スクリプトのパス</param>
        /// <returns>バンドル</returns>
        private static Bundle GetTransformClearedScriptBundle(string virtualPath, string scriptPath)
        {
            return GetTransformClearedScriptBundle(virtualPath, new string[] { scriptPath });
        }

        /// <summary>
        /// Transformをクリアしたバンドルを取得する
        /// </summary>
        /// <param name="virtualPath">仮想パス</param>
        /// <param name="scriptPaths">スクリプトのパス</param>
        /// <returns>バンドル</returns>
        private static Bundle GetTransformClearedScriptBundle(string virtualPath, params string[] scriptPaths)
        {
            Bundle bundle = new ScriptBundle(virtualPath).Include(scriptPaths);
            bundle.Transforms.Clear();
            return bundle;
        }
    }
}
