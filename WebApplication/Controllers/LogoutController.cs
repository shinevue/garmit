using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [AppSettings]
    public class LogoutController : Controller
    {
        public ActionResult Index()
        {
            return View(new ViewModel { Title = "ログアウト" });
        }
    }
}