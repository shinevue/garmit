using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Web.Accessor;

namespace garmit.Web.Controllers
{
    public class LicenseController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        
        public ActionResult MIT()
        {
            return View("MIT");
        }

        public ActionResult Apache()
        {
            return View("Apache");
        }
        
        public ActionResult BSD()
        {
            return View("BSD");
        }
    }
}