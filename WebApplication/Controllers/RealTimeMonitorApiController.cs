using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.RealTimeData;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// リアルタイムモニタ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/realTimeMonitor")]
    public class RealTimeMonitorApiController : ApiController
    {    
        /// <summary>
        /// リアルタイムデータサービス
        /// </summary>
        public IRealTimeDataService RealTimeDataService { get; set; }
        
        public RealTimeMonitorApiController()
        {
            RealTimeDataService = ServiceManager.GetService<IRealTimeDataService>("RealTimeDataService");
        }

        /// <summary>
        /// マスタデータを取得を取得
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUpData()
        {
            Session session = SessionAccessor.GetSession();
            RealTimeDataInfo info = new RealTimeDataInfo();

            try
            {
                info = RealTimeDataService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// リアルタイムデータ情報を取得
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getData")]
        public RealTimeDataInfo PostRealTimeData(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            RealTimeDataInfo info = new RealTimeDataInfo();

            try
            {
                info = RealTimeDataService.GetRealTimeDataInfo(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }
        
    }
}
