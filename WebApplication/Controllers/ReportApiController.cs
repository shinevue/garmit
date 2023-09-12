using garmit.DomainObject;
using System;
using System.Web.Http;
using garmit.Service.Report;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Globalization;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// レポートのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/report")]
    public class ReportApiController : ApiController
    {
        /// <summary>
        /// レポートサービス
        /// </summary>
        public IReportService ReportService { get; set; }

        public ReportApiController()
        {
            ReportService = ServiceManager.GetService<IReportService>("ReportService");
        }

        #region データレポート

        /// <summary>
        /// データレポートlookUp取得
        /// </summary>
        /// <returns></returns>
        [Route("data/lookUp")]
        public ReportInfo GetDataLookUp()
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetLookUpForValue(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// データレポート検索結果取得
        /// </summary>
        /// <returns></returns>
        [Route("data/result")]
        public ReportInfo SearchDataResult(LookUp condition)
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetValueReport(session, condition);

            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// データレポート検索（pointNoのリスト）結果取得
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("data/resultByPointNo")]
        public ReportInfo SearchDataResultByPointNos(GetDataResultByPointNoParameter parameter)
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetValueReport(session, parameter.LookUp, parameter.PointNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        #endregion

        #region アセットレポート

        /// <summary>
        /// データレポートlookUp取得
        /// </summary>
        /// <returns></returns>
        [Route("asset/lookUp")]
        public ReportInfo GetAssetLookUp()
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetLookUpForAsset(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// アセットレポート検索結果取得（ラック）
        /// </summary>
        /// <returns></returns>
        [Route("asset/rackResult")]
        public ReportInfo SearchRackResult(LookUp condition)
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetRackReport(session, condition);

            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }


        /// <summary>
        /// アセットレポート検索結果取得（ユニット）
        /// </summary>
        /// <returns></returns>
        [Route("asset/unitResult")]
        public ReportInfo SearchUnitResult(LookUp condition)
        {
            ReportInfo info = new ReportInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetUnitReport(session, condition);

            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        #endregion

        #region レポートスケジュール

        /// <summary>
        /// レポートスケジュール全取得（初期表示時に仕様）（GET)
        /// </summary>
        /// <returns>ReportScheduleInfo.ReportScheduleResult</returns>
        [Route("schedules")]
        public SearchResult GetSchedules()
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetSchedules(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.ReportScheduleResult ;
        }

        /// <summary>
        /// スケジュール一括削除
        /// </summary>
        /// <param name="param">削除対象スケジュールID群</param>
        /// <returns>ReportScheduleInfo.ReportSchedule</returns>
        [Route("schedules/delete")]
        public ReportScheduleInfo PostDeleteSchedules(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.DeleteSchedules(session, param.ScheduleIds);
                if (info.RequestResult.IsSuccess)
                {
                    info.RequestResult = DeleteOutputFolder(session.SystemId, param.ScheduleIds, session.CultureInfo);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// スケジュール1件を取得する
        /// </summary>
        /// <param name="param">レポートスケジュールID</param>
        /// <returns>ReportScheduleInfo.ReportSchedule</returns>
        [Route("schedule")]
        public ReportSchedule PostGetSchedule(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetSchedule(session, param.ScheduleId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.ReportSchedule;
        }

        /// <summary>
        /// スケジュール1件削除
        /// </summary>
        /// <param name="param">レポートスケジュールID</param>
        /// <returns>ReportScheduleInfo.ReportSchedule</returns>
        [Route("schedule/delete")]
        public ReportScheduleInfo PostDeleteSchedule(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            List<int> scheduleIds = new List<int> { param.ScheduleId };
            try
            {
                info = ReportService.DeleteSchedules(session, scheduleIds);
                if (info.RequestResult.IsSuccess)
                {
                    info.RequestResult = DeleteOutputFolder(session.SystemId, scheduleIds, session.CultureInfo);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 該当所属で表示可能な検索条件を取得する
        /// </summary>
        /// <param name="param">所属ID</param>
        /// <returns>ReportScheduleInfo.RequestResult / ReportSchedules</returns>
        [Route("schedule/save")]
        public ReportScheduleInfo PostSaveReportSchedule(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.SetSchedule(session, param.ReportSchedule);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info;
        }

        /// <summary>
        /// 該当所属で表示可能な検索条件を取得する
        /// </summary>
        /// <param name="param">所属ID</param>
        /// <returns>ReportScheduleInfo.LookUp</returns>
        [Route("schedule/lookUp")]
        public LookUp PostGetLookUp(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetLookUp(session, param.EnterpriseId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.LookUp;
        }

        /// <summary>
        /// 出力ファイル一覧取得
        /// </summary>
        /// <param name="param>レポートスケジュールID</param>
        /// <returns>ReportScheduleInfo.ReportSchedule</returns>
        [Route("outputFiles")]
        public SearchResult PostGetOutputFiles(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.GetOutputFiles(session, param.ScheduleId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.ReportOutputFileResult;
        }

        /// <summary>
        /// 出力ファイル一括削除
        /// </summary>
        /// <param name="param">レポートスケジュールID、ファイル番号一覧</param>
        /// <returns>ReportScheduleInfo.RequestResult / ReportOutputFileResult / ReportOutputFiles</returns>
        [Route("outputFiles/delete")]
        public ReportScheduleInfo PostDeleteOutputFiles(ReportScheduleQueryParameter param)
        {
            ReportScheduleInfo info = new ReportScheduleInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ReportService.DeleteOutputFiles(session, param.ScheduleId, param.FileNos);

                if (info.RequestResult != null && info.RequestResult.IsSuccess == true && info.ReportOutputFiles.Count() > 0)
                {
                    //ファイルのパスを取得する
                    string outputFolder = AppSettingAccessor.GetReportOutputFileDirectory();
                    string directory = System.Web.Hosting.HostingEnvironment.MapPath(outputFolder + @"/" + session.SystemId.ToString() + @"/" + param.ScheduleId.ToString() + @"/");
                    List <string> paths = info.ReportOutputFiles.Select(fileInfo =>
                        Path.Combine(directory, fileInfo.FileName)
                    ).ToList();
                    
                    //ファイル削除呼び出し
                    info.RequestResult.IsSuccess = FileAccesor.DeleteFiles(paths);
                    if (!info.RequestResult.IsSuccess)
                    {
                        info.RequestResult.Message = MessageUtil.GetMessage("ReportOutputFile_Delete_Error", session.CultureInfo);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 出力先フォルダを削除する
        /// </summary>
        /// <param name="systemId">システムID</param>
        /// <param name="reportScheduleIds">スケジュールID</param>
        /// <param name="cultureInfo">言語情報</param>
        /// <returns></returns>
        private RequestResult DeleteOutputFolder(int systemId, IEnumerable<int> reportScheduleIds, CultureInfo cultureInfo)
        {
            RequestResult result = new RequestResult { IsSuccess = true };
            IEnumerable<string> paths = GetOutputFolderPaths(systemId, reportScheduleIds);
            result.IsSuccess = FileAccesor.DeleteDirectories(paths);
            if (!result.IsSuccess)
            {
                result.Message = MessageUtil.GetMessage("ReportSchedule_DeleteFile_Error", cultureInfo);
            }
            return result;
        }

        /// <summary>
        /// 複数の出力先フォルダパスを取得する
        /// </summary>
        /// <param name="systemId">システムID</param>
        /// <param name="reportScheduleIds">スケジュールID</param>
        /// <returns></returns>
        private IEnumerable<string> GetOutputFolderPaths(int systemId, IEnumerable<int> reportScheduleIds)
        {
            List<string> paths = new List<string>();
            string outputFolder = AppSettingAccessor.GetReportOutputFileDirectory();

            foreach (int id in reportScheduleIds)
            {
                paths.Add(GetOutputFolderPath(systemId, id, outputFolder));
            }

            return paths;
        }

        /// <summary>
        /// 出力先フォルダパスを取得する
        /// </summary>
        /// <param name="systemId">システムID</param>
        /// <param name="reportScheduleId">スケジュールID</param>
        /// <param name="outputFolder">出力フォルダ</param>
        /// <returns></returns>
        private string GetOutputFolderPath(int systemId, int reportScheduleId, string outputFolder)
        {
            return System.Web.Hosting.HostingEnvironment.MapPath(outputFolder + @"/" + systemId.ToString() + @"/" + reportScheduleId.ToString());

        }

        #endregion

    }
    
}
