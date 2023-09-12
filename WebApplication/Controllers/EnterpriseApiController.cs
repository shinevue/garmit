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
using garmit.Service.Enterprise;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 所属一覧画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/Enterprise")]
    public class EnterpriseApiController : ApiController
    {
        /// <summary>
        /// 所属サービス
        /// </summary>
        public IEnterpriseService EnterpriseService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public EnterpriseApiController()
        {
            EnterpriseService = ServiceManager.GetService<IEnterpriseService>("EnterpriseService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            
            return info.LookUp;
        }

        /// <summary>
        /// 検索結果一覧を取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getEnterpriseResult")]
        public SearchResult PostEnterpriseResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.GetEnterprises(session, lookUp);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.EnterpriseResult;
        }

        /// <summary>
        /// 所属情報を取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getEnterprises")]
        public IEnumerable<Enterprise> PostEnterpriseInfo(IEnumerable<int> enterpriseIds)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.GetEnterprises(session, enterpriseIds);            
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Enterprises;
        }

        /// <summary>
        /// 所属を登録する
        /// </summary>
        /// <param name="enterprise"></param>
        /// <returns></returns>
        [Route("setEnterprise")]
        public RequestResult PostSetEnterprise(Enterprise enterprise)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.SetEnterprise(session, enterprise);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 複数の所属を登録する
        /// </summary>
        /// <param name="enterprises"></param>
        /// <returns></returns>
        [Route("setEnterprises")]
        public RequestResult PostSetEnterprises(IEnumerable<Enterprise> enterprises)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.SetEnterprises(session, enterprises);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 所属を削除する
        /// </summary>
        /// <param name="enterpriseId"></param>
        /// <returns></returns>
        [Route("deleteEnterprise")]
        public RequestResult GetDeleteEnterprise(int enterpriseId)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.DeleteEnterprise(session, enterpriseId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 複数の所属を削除する
        /// </summary>
        /// <param name="enterpriseIds"></param>
        /// <returns></returns>
        [Route("deleteEnterprises")]
        public RequestResult PostDeleteEnterprises(IEnumerable<int> enterpriseIds)
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.DeleteEnterprises(session, enterpriseIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
        
        /// <summary>
        /// 空の所属を取得する
        /// </summary>
        /// <returns></returns>
        [Route("newEnterprise")]
        public Enterprise GetNewUser()
        {
            return new Enterprise {
                MailAlarmTypeEnable = new AlarmType(),
                DataRefStartDate = DateTime.Now.Date,
                Level = -1,
                MailTo = new List<string>()
            };
        }

        /// <summary>
        /// ログインユーザーの属する所属一覧を取得する
        /// </summary>
        /// <returns></returns>
        [Route("enterprises")]
        public IEnumerable<Enterprise> GetEnterprises()
        {
            Session session = SessionAccessor.GetSession();
            EnterpriseInfo info = new EnterpriseInfo();

            try
            {
                info = EnterpriseService.GetEnterprises(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.Enterprises = null;
            }

            return info.Enterprises;
        }

    }
}
