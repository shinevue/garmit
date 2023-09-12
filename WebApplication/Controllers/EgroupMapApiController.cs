using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Service.EgroupMap;
using garmit.Core;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 電源系統表示のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/powerConnection")]
    public class PowerConnectionApiController : ApiController
    {
        /// <summary>
        /// 電源系統図サービス
        /// </summary>
        public IEgroupMapService EgroupMapService { get; set; }

        public PowerConnectionApiController()
        {
            EgroupMapService = ServiceManager.GetService<IEgroupMapService>("EgroupMapService");
        }

        /// <summary>
        /// 計測値取得
        /// </summary>
        /// <returns></returns>
        [Route("value")]
        public IEnumerable<ValueData> GetValue(int egroupId)
        {
            EgroupMapInfo info = new EgroupMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = EgroupMapService.GetMeasuredValues(session, egroupId, false);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.ValueDatas;
        }

        /// <summary>
        /// ラック情報取得
        /// </summary>
        /// <returns></returns>
        [Route("rack")]
        public EgroupMapInfo SetRackView(EgroupMapRackViewQuery parameter)
        {
            EgroupMapInfo info = new EgroupMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = EgroupMapService.GetConnectedRackAndUnits(session, parameter.EgroupId, parameter.BreakerNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }
        
    }
}
