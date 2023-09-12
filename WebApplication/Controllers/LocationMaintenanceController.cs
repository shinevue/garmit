using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.DomainObject;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    [RoutePrefix("Maintenance/Location")]
    public class LocationMaintenanceController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.LocationEdit);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "ロケーションメンテナンス",
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