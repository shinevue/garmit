using System;
using System.Configuration;

namespace garmit.Web.Accessor
{
    /// <summary>
    /// AppSettingのAccessor
    /// AppSettingにアクセスする場合はこのクラスを使います。
    /// </summary>
    public class AppSettingAccessor
    {
        /// <summary>
        /// ユニット画像格納ディレクトリを取得する
        /// </summary>
        /// <returns>ユニット画像のディレクトリ</returns>
        public static string GetImageDirectory()
        {
            return GetAppSetting("ImageDirectory");
        }

        /// <summary>
        /// サウンドファイル格納ディレクトリを取得する
        /// </summary>
        /// <returns></returns>
        public static string GetSoundDirectory()
        {
            return GetAppSetting("SoundDirectory");
        }

        /// <summary>
        /// サウンドファイル格納ディレクトリを取得する
        /// </summary>
        /// <returns></returns>
        public static string GetFloorMapImageDirectory()
        {
            return GetAppSetting("FloorMapImageDirectory");
        }

        /// <summary>
        /// レポート出力ファイル格納ディレクトリを取得する
        /// </summary>
        /// <returns>レポート出力ファイルのディレクトリ</returns>
        public static string GetReportOutputFileDirectory()
        {
            return GetAppSetting("ReportOutputFileDirectory");
        }

        #region private関数

        /// <summary>
        /// アプリケーション設定を読み込む
        /// キーが間違っている場合は空文字を返します
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>設定値</returns>
        private static string GetAppSetting(string key)
        {
            return ConfigurationManager.AppSettings[key];
        }

        /// <summary>
        /// int型の設定値を取得する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>int型の設定値</returns>
        private static int GetIntSetting(string key)
        {
            int retValue;
            string valueStr = GetAppSetting(key);

            if (!int.TryParse(valueStr, out retValue))
            {
                retValue = 0;
            }

            return retValue;
        }

        /// <summary>
        /// float型の設定値を取得する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>float型の設定値</returns>
        private static float GetFloatSetting(string key)
        {
            float retValue;
            string valueStr = GetAppSetting(key);

            if (!float.TryParse(valueStr, out retValue))
            {
                retValue = (float)0.0;
            }

            return retValue;
        }

        /// <summary>
        /// double型の設定値を取得する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>double型の設定値</returns>
        private static double GetDoubleSetting(string key)
        {
            double retValue;
            string valueStr = GetAppSetting(key);

            if (!double.TryParse(valueStr, out retValue))
            {
                retValue = 0.0;
            }

            return retValue;
        }

        /// <summary>
        /// bool型の設定値を取得する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>bool型の設定値</returns>
        private static bool GetBoolSetting(string key)
        {
            bool retValue;
            string valueStr = GetAppSetting(key);

            if (!bool.TryParse(valueStr, out retValue))
            {
                retValue = false;
            }

            return retValue;
        }

        /// <summary>
        /// DateTime型の設定値を取得する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>DateTime型の設定値</returns>
        private static DateTime GetDateTimeSetting(string key)
        {
            DateTime retValue;
            string valueStr = GetAppSetting(key);

            if (!DateTime.TryParse(valueStr, out retValue))
            {
                retValue = DateTime.Now;
            }

            return retValue;
        }

        #endregion
    }
}