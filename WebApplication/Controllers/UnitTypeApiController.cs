using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.UnitType;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ユニット種別のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/unitType")]
    public class UnitTypeApiController : ApiController
    {
        /// <summary>
        /// ユニット種別サービス
        /// </summary>
        public IUnitTypeService UnitTypeService { get; set; }

        public UnitTypeApiController()
        {
            UnitTypeService = ServiceManager.GetService<IUnitTypeService>("UnitTypeService");
        }

        /// <summary>
        /// ユニット種別を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getUnitTypes")]
        public IEnumerable<UnitType> GetUnitTypes()
        {
            Session session = SessionAccessor.GetSession();
            UnitTypeInfo info = new UnitTypeInfo();

            try
            {
                info = UnitTypeService.GetUnitTypes(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.UnitTypes;
        }

        /// <summary>
        /// ユニット種別を保存する
        /// </summary>
        /// <param name="unitType"></param>
        /// <returns></returns>
        [Route("setUnitType")]
        public RequestResult PostSetUnitType(UnitType unitType)
        {
            Session session = SessionAccessor.GetSession();
            UnitTypeInfo info = new UnitTypeInfo();

            try
            {
                info = UnitTypeService.SetUnitType(session, unitType);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユニット種別を削除する
        /// </summary>
        /// <param name="typeId"></param>
        /// <returns></returns>
        [Route("deleteUnitType")]
        public RequestResult GetDeleteUnitType(int typeId)
        {
            Session session = SessionAccessor.GetSession();
            UnitTypeInfo info = new UnitTypeInfo();

            try
            {
                info = UnitTypeService.DeleteUnitType(session, typeId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユニット種別を削除する
        /// </summary>
        /// <param name="unitTypes"></param>
        /// <returns></returns>
        [Route("deleteUnitTypes")]
        public RequestResult PostDeleteUnitTypes(IEnumerable<int> typeIds)
        {
            Session session = SessionAccessor.GetSession();
            UnitTypeInfo info = new UnitTypeInfo();

            try
            {
                info = UnitTypeService.DeleteUnitTypes(session, typeIds);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;           
        }

        /// <summary>
        /// 空のユニット種別を取得する
        /// </summary>
        /// <returns></returns>
        [Route("newUnitType")]
        public UnitType GetNewUnitType()
        {
            Session session = SessionAccessor.GetSession();

            return new UnitType
            {
                SystemId = session.SystemId,
                TypeId = -1,
                Name = ""
            };
        }
    }
}
