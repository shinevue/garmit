using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Core;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/auth")]
    public class AuthenticationApiController : ApiController
    {
        /// <summary>
        /// 認証情報を取得する
        /// </summary>
        /// <param name="functionId">機能番号</param>
        /// <returns>認証情報</returns>
        [Route("")]
        public AuthenticationInfo GetAuthenticationInfo(int functionId)
        {
            AuthenticationInfo info = new AuthenticationInfo();

            try
            {
                info = AuthenticationAccessor.GetAuthenticationInfo(functionId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

    }
}
