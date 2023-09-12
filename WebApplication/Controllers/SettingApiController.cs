using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using System.Drawing;
using System.IO;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Binding;
using garmit.Service.System;


namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/setting")]
    public class SettingApiController : ApiController
    {
        /// <summary>
        /// システムサービス
        /// </summary>
        public ISystemService SystemService { get; set; }
        
        public SettingApiController()
        {
            SystemService = ServiceManager.GetService<ISystemService>("SystemService");
        }

        /// <summary>
        /// システム設定を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getSetting")]
        public SystemInfo GetSystemSet()
        {
            Session session = SessionAccessor.GetSession();
            SystemInfo info = new SystemInfo();

            try
            {
                info = SystemService.GetSystemInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// メール設定を保存する
        /// </summary>
        /// <param name="systemSet"></param>
        /// <returns></returns>
        [Route("setMailSetting")]
        public bool PostSystemSetMail(SystemSet systemSet)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = SystemService.SetSystemSetMail(session, systemSet);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// デフォルト設定を保存する
        /// </summary>
        /// <param name="systemSet"></param>
        /// <returns></returns>
        [Route("setDefaultSetting")]
        public bool PostSystemSetDefault(SettingParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = SystemService.SetSystemSetDefault(session, parameter.SystemSet);

                if(ret == true)
                {
                    ret = SystemService.SetDataTypesDefault(session, parameter.DataTypes);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// サウンド設定を保存する
        /// </summary>
        /// <param name="systemSet"></param>
        /// <returns></returns>
        [Route("setSoundSetting")]
        public bool PostSystemSetSound(SettingParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            bool ret = false;

            try
            {
                ret = SystemService.SetSystemSetSound(session, parameter.SystemSet);

                if (ret == true)
                {
                    ret = SystemService.SetDataTypesSound(session, parameter.DataTypes);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// サウンドファイルの格納ディレクトリを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getSoundDirectory")]
        public string GetSoundDirectory()
        {
            Session session = SessionAccessor.GetSession();
            return AppSettingAccessor.GetSoundDirectory() + '/' + session.SystemId;
        }

        /// <summary>
        /// サウンドファイルリストを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getSoundList")]
        public IEnumerable<string> GetSoundFileList()
        {
            List<string> list = new List<string>();
            Session session = SessionAccessor.GetSession();

            try
            {
                string uploadFolder = AppSettingAccessor.GetSoundDirectory();
                string[] files = Directory.GetFiles(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + uploadFolder + '/' + session.SystemId));
                foreach (string file in files)
                {
                    list.Add(Path.GetFileName(file));
                }
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return list;
        }
        
        /// <summary>
        /// サウンドファイルを保存する
        /// </summary>
        /// <param name="media"></param>
        /// <returns></returns>
        [Route("setSoundFile")]
        public bool PostAddSoundFile([FromBody]Media media)
        {
            Session session = SessionAccessor.GetSession();

            if (media == null)
            {
                return false;
            }

            bool ret = false;

            try
            {
                // サウンドファイル格納URLを取得
                string uploadFolder = AppSettingAccessor.GetSoundDirectory();
                
                // ファイル名を取得
                string filePath = media.FileName.Replace("\"", "");
                string fileName = Path.GetFileName(filePath);

                DirectoryInfo dir = new DirectoryInfo(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + uploadFolder + '/' + session.SystemId));

                if (!dir.Exists)
                {
                    Directory.CreateDirectory(dir.FullName);
                }

                // サウンドファイルのパスを生成
                FileInfo fi = new FileInfo(Path.Combine(dir.FullName, fileName));
                Logger.Instance.LogMessage(fi.FullName, Logger.LogLevel.Debug);

                File.WriteAllBytes(fi.FullName, media.Buffer);

                ret = true;
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// サウンドファイルを削除する
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        [Route("deleteSoundFile")]
        public bool GetDeleteSoundFile(string fileName)
        {
            bool ret = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                // サウンドファイル格納URLを取得
                string uploadFolder = AppSettingAccessor.GetSoundDirectory();

                FileInfo fi = new FileInfo(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + uploadFolder + '/' + session.SystemId + '/' + fileName));

                if (fi.Exists)
                {
                    // 読み取り専用属性がある場合は、読み取り専用属性を解除する
                    if ((fi.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly)
                    {
                        fi.Attributes = FileAttributes.Normal;
                    }
                    // ファイルを削除する
                    fi.Delete();

                    ret = true;
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// ICカード種別取得
        /// </summary>
        /// <returns></returns>
        [Route("getIcCardType")]
        public int? GetIcCardType()
        {
            SystemInfo info = GetSystemSet();
            return info?.SystemSet?.IcCardType;
        }
    }
}
