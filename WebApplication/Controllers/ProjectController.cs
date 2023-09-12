using garmit.DomainObject;
using garmit.Web.Filter;
using garmit.Web.Models;
using System.Web.Mvc;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    public class ProjectController : Controller
    {
        /// <summary>
        /// 案件画面を表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.Project);
            
            if (viewModel.IsSuccess)
            {
                return View(
                    new ViewModel
                    {
                        Title = "案件",
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