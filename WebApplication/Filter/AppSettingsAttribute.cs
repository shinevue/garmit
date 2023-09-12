using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Models;

namespace garmit.Web.Filter
{
    /// <summary>
    /// ViewBagにWeb.configのAppSetting設定を追加し、JavaScript等で利用できるようにする
    /// </summary>
    public class AppSettingsAttribute: ActionFilterAttribute
    {
        /// <summary>
        /// JavaScriptに渡すAppSetting設定のキー（必要なモノのみをJSに渡す）
        /// </summary>
        private readonly string[] APPSETTING_KEYS = new string[] {
            "IllegalString",
            "PollIntervalMinSec",
            "PollIntervalMaxSec",
            "RecordIntervalMinSec",
            "RecordIntervalMaxSec",
            "TrendGraphMaxPointCount",
            "TagMaxPointCount",
            "TagMaxRackCount",
            "TagMaxUnitCount",
            "KeepTextCondition",
            "UseSsl",
            "BaudRate",
            "DataBits",
            "StopBits",
            "Parity",
            "FlowControl",
            "CardReadSoundFile"
        };
                
        /// <summary>
        /// アクションメソッド実行後に発生する（オーバーライド）
        /// </summary>
        /// <param name="filterContext">フィルターコンテキスト</param>
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            var viewResult = filterContext.Result as ViewResult;
            if (viewResult == null)
            {
                return;
            }

            var model = (ViewModel)filterContext.Controller.ViewData.Model;
            model.AppSettings = ConfigurationManager.AppSettings.AllKeys
                                                    .Where(key => APPSETTING_KEYS.Contains(key))
                                                    .ToDictionary(key => key, key => ConfigurationManager.AppSettings[key]);

            base.OnActionExecuted(filterContext);
        }
    }
}