using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.Logout;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ログアウト画面のAPIコントローラ
    /// </summary>
    [RoutePrefix("api/logout")]
    public class LogoutApiController : ApiController
    {
        /// <summary>
        /// ログアウトサービス
        /// </summary>
        public ILogoutService LogoutService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public LogoutApiController()
        {
            LogoutService = ServiceManager.GetService<ILogoutService>("LogoutService");
        }

        /// <summary>
        /// 初期データ取得（GET受信）
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public bool Get()
        {
            Session session = SessionAccessor.GetSession();

            try
            {
                LogoutService.Logout(session.UserId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            finally
            {
                SessionAccessor.Abandon();  // セッションを破棄
            }

            return true;
        }

    }
}
