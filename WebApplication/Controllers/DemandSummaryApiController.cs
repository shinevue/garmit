using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.DemandSummaryService;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// デマンドサマリ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/DemandSummary")]
    public class DemandSummaryApiController : ApiController
    {
        /// <summary>
        /// デマンドサマリサービス
        /// </summary>
        IDemandSummaryService DemandSummaryService { get; set; }

        public DemandSummaryApiController()
        {
            DemandSummaryService = ServiceManager.GetService<IDemandSummaryService>("DemandSummaryService");
        }

        /// <summary>
        /// マスターデータを取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            DemandSummaryInfo info = new DemandSummaryInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DemandSummaryService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 検索条件からデマンドサマリを取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getResult")]
        public SearchResult PostGetDemandSetResult(LookUp lookUp)
        {
            DemandSummaryInfo info = new DemandSummaryInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DemandSummaryService.GetDemandSummary(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandSummaryResult;
        }        

    }
}
