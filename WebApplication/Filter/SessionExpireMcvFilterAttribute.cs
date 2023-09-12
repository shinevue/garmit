using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using garmit.Core;
using garmit.Web.Accessor;

namespace garmit.Web.Filter
{
    /// <summary>
    /// セッションタイムアウトフィルター（コントローラ用）
    /// </summary>
    public class SessionExpireMcvFilterAttribute: ActionFilterAttribute
    {
        /// <summary>
        /// アクションメソッド呼び出し前に発生する。（オーバーライド）
        /// セッションタイムアウトエラーのチェックを行う
        /// </summary>
        /// <param name="filterContext">フィルターコンテキスト</param>
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext context = HttpContext.Current;
            bool isTimeout = false;
            
            //セッションがサポートされているか
            if (context.Session != null)
            {
                //新しいセッションIDが生成されているか
                if (context.Session.IsNewSession)
                {
                    string sessionCookie = context.Request.Headers["Cookie"];
                    if (sessionCookie != null && sessionCookie.IndexOf("ASP.NET_SessionId") >= 0)
                    {
                        isTimeout = true;
                    }
                }
                else
                {
                    //セッションに登録した内容があるかどうか
                    if (context.Session[SessionAccessor.CST_SESSIONKEY_USERID] == null)
                    {
                        isTimeout = true;
                    }
                }                
            }
            
            if (isTimeout)
            {
                Logger.Instance.LogMessage("セッションタイムアウト", Logger.LogLevel.Debug);
                filterContext.Result = new RedirectResult("/Error/SessionError");              //TODO：エラー画面ができたら、リダイレクトするページを修正する
            }

            base.OnActionExecuting(filterContext);

        }
        
    }
}