using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.DemandGraph;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// デマンドグラフ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/DemandGraph")]
    public class DemandGraphApiController : ApiController
    {
        /// <summary>
        /// デマンドグラフサービス
        /// </summary>
        public IDemandGraphService DemandGraphService { get; set; }

        public DemandGraphApiController()
        {
            DemandGraphService = ServiceManager.GetService<IDemandGraphService>("DemandGraphService");
        }

        /// <summary>
        /// マスターデータを取得
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            DemandGraphInfo info = new DemandGraphInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DemandGraphService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// リアルタイムのデマンドグラフを取得
        /// </summary>
        /// <param name="period"></param>
        /// <returns></returns>
        [Route("getRealtimeDemandGraph")]
        public DemandGraph PostGetRealtimeDemandGraph(LookUp lookUp)
        {
            DemandGraphInfo info = new DemandGraphInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DemandGraphService.GetRealtimeDemandGraph(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandGraph;
        }

        /// <summary>
        /// ダイジェストのデマンドグラフを取得
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getDigestDemandGraph")]
        public DemandGraph PostGetDigestDemandGraph(LookUp lookUp)
        {
            DemandGraphInfo info = new DemandGraphInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DemandGraphService.GetDigestDemandGraph(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandGraph;
        }
    }
}
