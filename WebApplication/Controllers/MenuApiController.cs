using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Menu;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/menu")]
    public class MenuApiController : ApiController
    {

        /// <summary>
        /// メニューサービス
        /// </summary>
        public IMenuService MenuService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public MenuApiController()
        {
            MenuService = ServiceManager.GetService<IMenuService>("MenuService");
        }

        [Route("")]
        public MenuInfo GetMenuInfo()
        {
            MenuInfo info = new MenuInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = MenuService.GetInitialItem(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }
        
    }
}
