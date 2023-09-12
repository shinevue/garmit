using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// エラー画面コントローラー
    /// </summary>
    public class ErrorController : Controller
    {
        /// <summary>
        /// エラーページを表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 権限エラーページを表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult AuthError()
        {
            return View("AuthError");
        }

        /// <summary>
        /// セッションエラーページを表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult SessionError()
        {
            return View("SessionError");
        }

        /// <summary>
        /// ログイン認証エラーページを表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult LoginAuthError()
        {
            return View("LoginAuthError");
        }

        /// <summary>
        /// HTTPエラーページを表示する
        /// </summary>
        /// <returns></returns>
        public ActionResult HttpError()
        {
            //エラーコード取得
            string codeStr = Request.Params["errorCode"];
            HttpErrorMessage httpError = new HttpErrorMessage(codeStr);            
            return View("HttpError", new ViewModel { ErrorMessage = httpError });
        }

         
    }
}