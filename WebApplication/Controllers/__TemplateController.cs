using garmit.DomainObject;
using garmit.Web.Filter;
using garmit.Web.Models;
using System.Web.Mvc;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// Controllerテンプレート
    /// 
    /// TODO："__Template"を修正する
    /// </summary>
    [SessionExpireMcvFilter]
    [AppSettings]
    public class __TemplateController : Controller
    {
        //TODO：下記のXXXを画面名及び機能番号に変更する

        /// <summary>
        /// XXX画面を表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            //TODO："Dashboard"をDomainObjectで指定された機能番号に変更する
            ControllerViewModel viewModel = new ControllerViewModel(Function.FUNCTION_ID_e.Dashboard);

            if (viewModel.IsSuccess)
            {
                //TODO：下記のXXXを画面名に変更する
                return View(
                    new ViewModel
                    {
                        Title = "XXX",
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