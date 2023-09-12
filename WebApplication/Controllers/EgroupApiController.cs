using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Core;
using garmit.Web.Filter;
using garmit.Web.Accessor;
using garmit.Service.Egroup;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 電源系統表示のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/power")]
    public class EgroupApiController : ApiController
    {
        /// <summary>
        /// サービス
        /// </summary>
        public IEgroupService EgroupService { get; set; }

        public EgroupApiController()
        {
            EgroupService = ServiceManager.GetService<IEgroupService>("EgroupService");
        }

        /// <summary>
        /// GET受信のサンプル
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public EgroupInfo GetInitialInfo()
        {
            Session session = SessionAccessor.GetSession();
            EgroupInfo info = new EgroupInfo();

            try
            {
                info = EgroupService.GetEgroupInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// 電源系統を保存する
        /// </summary>
        /// <param name="egroup"></param>
        /// <returns></returns>
        [Route("setEgroup")]
        public bool PostSetEgroup(Egroup egroup)
        {
            Session session = SessionAccessor.GetSession();
            bool result = false;

            try
            {
                result = EgroupService.SetEgroup(session, egroup);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 電源系統の並び順を保存する
        /// </summary>
        /// <param name="egroups"></param>
        /// <returns></returns>
        [Route("setSortOrder")]
        public bool PostSetEgroups(IEnumerable<Egroup> egroups)
        {
            Session session = SessionAccessor.GetSession();
            bool result = false;

            try
            {
                result = EgroupService.SetEgroupsDispIndex(session, egroups);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }
        
        /// <summary>
        /// 電源系統を削除する
        /// </summary>
        /// <param name="egroup"></param>
        /// <returns></returns>
        [Route("deleteEgroup")]
        public bool PostDeleteEgroup(Egroup egroup)
        {
            Session session = SessionAccessor.GetSession();
            bool result = false;

            try
            {
                result = EgroupService.DeleteEgroup(session, egroup);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 空の電源系統を取得する
        /// </summary>
        /// <returns></returns>
        [Route("newEgroup")]
        public Egroup GetNewEgroup()
        {
            Session session = SessionAccessor.GetSession();

            return new Egroup {
                SystemId = session.SystemId,
                EgroupId = -1
            };
        }
        
        /// <summary>
        /// ブレーカー一覧を取得する
        /// </summary>
        /// <param name="egroupIds">電源系統IDリスト</param>
        /// <returns></returns>
        [Route("getBreakers")]
        public IEnumerable<Breaker> PostGetBreaker(IEnumerable<int> egroupIds)
        {
            Session session = SessionAccessor.GetSession();
            EgroupInfo info = new EgroupInfo();

            try
            {
                info = EgroupService.GetBreakers(session, egroupIds);
            }
            catch (Exception ex)
            {                
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.Breakers;
        }
    }

}
