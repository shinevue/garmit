using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.TrendGraph;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// トレンドグラフ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/TrendGraph")]
    public class TrendGraphApiController : ApiController
    {
        /// <summary>
        /// トレンドグラフサービス
        /// </summary>
        public ITrendGraphService TrendGraphService { get; set; }

        public TrendGraphApiController()
        {
            TrendGraphService = ServiceManager.GetService<ITrendGraphService>("TrendGraphService");
        }

        /// <summary>
        /// マスターデータを取得
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            TrendGraphInfo info = new TrendGraphInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = TrendGraphService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 検索条件からグラフデータを取得
        /// </summary>
        /// <param name="period"></param>
        /// <returns></returns>
        [Route("getData")]
        public TrendGraphInfo PostTrendGraphInfo(LookUp lookUp)
        {
            TrendGraphInfo info = new TrendGraphInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = TrendGraphService.GetTrendGraphInfo(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// ポイント一覧からトレンドグラフ情報取得
        /// </summary>
        [Route("getByPoint")]
        public TrendGraphInfo SetTrendGraphInfoByPoint(PointTrendQueryParameter parameter)
        {
            TrendGraphInfo info = new TrendGraphInfo();
            Session session = SessionAccessor.GetSession();
            
            try
            {
                info=TrendGraphService.GetTrendGraphInfo(session, parameter.LookUp, parameter.PointNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info;
        }

        /// <summary>
        /// トレンドグラフ設定を保存する
        /// </summary>
        /// <param name="trendGraphSet"></param>
        /// <returns></returns>
        [Route("setTrendGraphSet")]
        public bool PostSetTrendGraphSet(TrendGraphSet trendGraphSet)
        {
            bool result = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                result = TrendGraphService.SetTrendGraphSet(session, trendGraphSet);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }
        
    }
}
