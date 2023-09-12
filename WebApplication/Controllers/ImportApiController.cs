using garmit.Core;
using garmit.Web.Binding;
using garmit.Web.Filter;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.DomainObject;
using garmit.Service.Export;
using garmit.Service.Import;
using System;
using System.Web;
using System.Web.Http;
using System.IO;
using System.Collections.Generic;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// インポート画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/import")]
    public class ImportApiController : ApiController
    {
        public IExportService ExportService { get; set; }
        public IImportService ImportService { get; set; }

        public ImportApiController()
        {
            ExportService = ServiceManager.GetService<IExportService>("ExportService");
            ImportService = ServiceManager.GetService<IImportService>("ImportService");
        }

        /// <summary>
        /// マスタデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            ExportInfo info = new ExportInfo();

            try
            {
                info = ExportService.GetLookUp(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// エクスポート設定を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getExportSet")]
        public ExportSet GetExportSet()
        {
            Session session = SessionAccessor.GetSession();
            ExportInfo info = new ExportInfo();

            try
            {
                info = ExportService.GetExportSet(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ExportSet;
            
        }

        /// <summary>
        /// エクスポートする
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("export")]
        public ExportInfo PostExportData(ExportQueryParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            ExportInfo info = new ExportInfo();

            try
            {
                info = ExportService.Export(session, parameter.LookUp, parameter.ICCardCondition, parameter.ExportSet, parameter.ExportTypes, parameter.IsFormatOnly, parameter.WithoutSave);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// インポートする
        /// </summary>
        /// <param name="importInfo"></param>
        /// <returns></returns>
        [Route("import")]
        public RequestResult PostImportData(ImportInfo importInfo)
        {
            Session session = SessionAccessor.GetSession();
            ImportInfo info = new ImportInfo();

            try
            {
                info = ImportService.Import(session, importInfo);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
        
    }
}
