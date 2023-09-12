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
    [RoutePrefix("Maintenance/Graphic")]
    public class GraphicController : Controller
    {
        [Route("")]
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.GraphicEdit);

            if (viewModel.IsSuccess)
            {
                Session session = SessionAccessor.GetSession();
                return View(
                    new ViewModel
                    {
                        Title = "グラフィック",
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