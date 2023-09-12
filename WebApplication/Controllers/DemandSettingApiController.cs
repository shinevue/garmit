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
using garmit.Service.DemandSet;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// デマンドグラフ画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/DemandSetting")]
    public class DemandSettingApiController : ApiController
    {

        /// <summary>
        /// デマンド設定サービス
        /// </summary>
        public IDemandSetService DemandSetService { get; set; }
        
        public DemandSettingApiController()
        {
            DemandSetService = ServiceManager.GetService<IDemandSetService>("DemandSetService");
        }

        /// <summary>
        /// マスターデータを取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 検索条件からデマンド設定一覧を取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getDemandSetResult")]
        public SearchResult PostGetDemandSetResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.GetDemandSetList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandSetResult;
        }

        /// <summary>
        /// デマンド設定を取得する
        /// </summary>
        /// <param name="locationId"></param>
        /// <returns></returns>
        [Route("getDemandSet")]
        public DemandSet GetGetDemandSet(int locationId)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.GetDemandSet(session, locationId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandSets.First();
        }

        /// <summary>
        /// デマンド設定を取得する（複数）
        /// </summary>
        /// <param name="locationIds"></param>
        [Route("getDemandSets")]
        public IEnumerable<DemandSet> PostGetDemandSets(IEnumerable<int> locationIds)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.GetDemandSets(session, locationIds, false);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.DemandSets;
        }

        /// <summary>
        /// デマンド設定を保存する
        /// </summary>
        /// <returns></returns>
        [Route("setDemandSet")]
        public RequestResult PostSetDemandSet(DemandSet demandSet)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.SetDemandSet(session, demandSet);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// デマンド設定を保存する（複数）
        /// </summary>
        /// <param name="demandSets"></param>
        /// <returns></returns>
        [Route("setDemandSets")]
        public RequestResult PostSetDemandSets(IEnumerable<DemandSet> demandSets)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.SetDemandSets(session, demandSets);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;

        }

        /// <summary>
        /// デマンド設定を削除する
        /// </summary>
        /// <param name="locationId"></param>
        [Route("deleteDemandSet")]
        public RequestResult GetDeleteDemandSet(int locationId)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.DeleteDemandSet(session, locationId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// デマンド設定を削除する（複数）
        /// </summary>
        /// <param name="locationIds"></param>
        /// <returns></returns>
        [Route("deleteDemandSets")]
        public RequestResult PostDeleteDemandSets(IEnumerable<int> locationIds)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.DeleteDemandSets(session, locationIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空のデマンド設定を返す
        /// </summary>
        [Route("newDemandSet")]
        public DemandSet GetGetNewDemandSet()
        {
            return new DemandSet();
        }

        /// <summary>
        /// デマンド設定を取得する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("getTriggerThresholds")]
        public IEnumerable<DemandSet> PostGetDemandSetWithThreshold(IdIntegerQueryParameter param)
        {
            Session session = SessionAccessor.GetSession();
            DemandSetInfo info = new DemandSetInfo();

            try
            {
                info = DemandSetService.GetDemandSet(session, param.Id, true);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.DemandSets;
        }

    }
}
