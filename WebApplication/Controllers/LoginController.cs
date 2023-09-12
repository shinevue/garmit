using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    public class LoginController : Controller
    {
        [AppSettings]
        public ActionResult Index()
        {
            SessionAccessor.Abandon();  //ログイン画面表示時はセッションを破棄する
            return View(new ViewModel { Title = "ログイン" });
        }
    }
}