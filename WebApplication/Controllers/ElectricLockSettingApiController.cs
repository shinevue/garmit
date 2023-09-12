using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Service.ERackSet;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 電気錠設定画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/ElectricLockSetting")]
    public class ElectricLockSettingApiController : ApiController
    {
        /// <summary>
        /// 電気錠設定サービス
        /// </summary>
        public IERackSetService ERackSetService { get; set; }

        public ElectricLockSettingApiController()
        {
            ERackSetService = ServiceManager.GetService<IERackSetService>("ERackSetService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 電気錠設定一覧を返却する（検索結果）
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getERackSetList")]
        public SearchResult PostERackSetResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.GetERackSetList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ERackSetResult;
        }

        /// <summary>
        /// 電気錠設定を取得する
        /// </summary>
        /// <param name="eRackSetIds"></param>
        /// <returns></returns>
        [Route("getERackSets")]
        public IEnumerable<ERackSet> PostGetERackSet(IEnumerable<int> eRackSetIds)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.GetERackSets(session, eRackSetIds);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ERackSets;
        }

        /// <summary>
        /// ポイントNoから電気錠設定を取得する
        /// </summary>
        /// <param name="pointNos"></param>
        /// <returns></returns>
        [Route("getERackSetsByPointNos")]
        public IEnumerable<ERackSet> PostGetERackSetByPointNos(IEnumerable<int> pointNos)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.GetERackSetsByPointNos(session, pointNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ERackSets;
        }

        /// <summary>
        /// 電気錠設定を保存する
        /// </summary>
        /// <param name="eRackSet"></param>
        /// <returns></returns>
        [Route("setERackSet")]
        public RequestResult PostSetERackSet(ERackSet eRackSet)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                if (eRackSet.ERackSetId == -1) eRackSet.SystemId = session.SystemId;
                info = ERackSetService.SetERackSet(session, eRackSet);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 電気錠設定を一括保存する
        /// </summary>
        /// <param name="eRackSets"></param>
        /// <returns></returns>
        [Route("setERackSets")]
        public RequestResult PostSetERackSets(IEnumerable<ERackSet> eRackSets)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.SetERackSets(session, eRackSets);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 電気錠設定を削除する
        /// </summary>
        /// <param name="eRackSetId"></param>
        /// <returns></returns>
        [Route("deleteERackSet")]
        public RequestResult GetDeleteERackSet(int eRackSetId)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.DeleteERackSet(session, eRackSetId);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 電気錠設定を削除する（複数）
        /// </summary>
        /// <param name="eRackSetIds"></param>
        /// <returns></returns>
        [Route("deleteERackSets")]
        public RequestResult PostDeleteERackSets(IEnumerable<int> eRackSetIds)
        {
            Session session = SessionAccessor.GetSession();
            ERackSetInfo info = new ERackSetInfo();

            try
            {
                info = ERackSetService.DeleteERackSets(session, eRackSetIds);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空の電気錠設定を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getNewERackSet")]
        public ERackSet GetGetNewERackSet()
        {
            return new ERackSet();
        }
    }
}
