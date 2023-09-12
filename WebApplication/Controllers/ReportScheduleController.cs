using garmit.DomainObject;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Controllers
{
    public class ReportScheduleController : Controller
    {
        /// <summary>
        /// レポートスケジュール画面を表示する
        /// </summary>
        /// <returns></returns>
        [SessionExpireMcvFilter]
        [AppSettings]
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.ReportSchedule);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "レポート",
                        FunctionName = viewModel.FunctionName,
                        IconClass = viewModel.IconClass,
                    }
                );
            }
            else
            {
                TempData = viewModel.TempData;
                return RedirectToAction(viewModel.ActionName, viewModel.ControllerName);
            }
        }
    }
}