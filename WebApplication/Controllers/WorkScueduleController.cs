using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Filter;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    public class WorkScheduleController : Controller
    {
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.Working);

            if (viewModel.IsSuccess)
            {
                Session session = SessionAccessor.GetSession();
                return View(
                    new ViewModel
                    {
                        Title = "スケジュール登録",
                        FunctionName = viewModel.FunctionName,
                        IconClass = viewModel.IconClass,
                        SystemId = session.SystemId
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