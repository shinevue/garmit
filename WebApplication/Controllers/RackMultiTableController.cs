using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 段組みラックポップアップのコントローラ
    /// </summary>
    public class RackMultiTableController : Controller
    {
        /// <summary>
        /// 段組みラック画面を表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View(new ViewModel { Title = "ラック未選択" });
        }
    }
}