using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.DomainObject;
using System.Configuration;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [RoutePrefix("LocationView")]
    public class LocationViewController : Controller
    {
        [Route("")]
        // GET: RobotControl
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.LocationView);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "ロケーションビュー",
                        FunctionName = viewModel.FunctionName,
                        IconClass = viewModel.IconClass,
                        AppSettings = GetAppSettings()
                    }
                );
            }
            else
            {
                TempData = viewModel.TempData;
                return RedirectToAction(viewModel.ActionName, viewModel.ControllerName);
            }
        }

        /// <summary>
        /// 使用するAppSettingsを取得する
        /// </summary>
        /// <returns></returns>
        private Dictionary<string, string> GetAppSettings()
        {
            Dictionary<string, string> appSettings = new Dictionary<string, string>
            {
                { "Series", ConfigurationManager.AppSettings["Series"] }
            };
            return appSettings;
        }
    }
}