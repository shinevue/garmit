using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireMcvFilter]
    [AppSettings]
    public class TopController : Controller
    {
        public ActionResult Index()
        {
            ViewModel model = new ViewModel
            {
                Title = "トップ",
                FunctionName = "ダッシュボード",
                IconClass = "icon-garmit-dashboard"
            };
            return View(model);
        }
    }
}