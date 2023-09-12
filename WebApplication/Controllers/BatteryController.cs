using System.Web.Mvc;
using garmit.DomainObject;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    public class BatteryController : Controller
    {
        /// <summary>
        /// バッテリー画面を表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.Battery);

            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "バッテリー",
                        FunctionName = viewModel.FunctionName,
                        IconClass = viewModel.IconClass
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